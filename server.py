import os
import json
import random
import time
from flask import Flask, request, send_from_directory, jsonify, send_file
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from sib_api_v3_sdk import ApiClient, Configuration, TransactionalEmailsApi, SendSmtpEmail
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Initialize Firebase
# Try environment variable first (for Render), fallback to file (for local)
firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
if firebase_creds_json:
    # Load from environment variable (production)
    cred_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(cred_dict)
else:
    # Load from file (local development)
    cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json"))

firebase_admin.initialize_app(cred)
db = firestore.client()

# Brevo setup
configuration = Configuration()
configuration.api_key['api-key'] = os.getenv("BREVO_API_KEY")
brevo_api = TransactionalEmailsApi(ApiClient(configuration))

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

@app.route('/')
def serve_login():
    """Serve admin login page"""
    return send_file('login.html')

@app.route('/login.html')
def serve_login_alt():
    """Serve admin login page alternative route"""
    return send_file('login.html')

@app.route('/dashboard.html')
def serve_dashboard():
    """Serve admin dashboard"""
    return send_file('dashboard.html')

@app.route('/tournaments.html')
def serve_tournaments():
    """Serve tournaments page"""
    return send_file('tournaments.html')

@app.route('/withdrawals.html')
def serve_withdrawals():
    """Serve withdrawals page"""
    return send_file('withdrawals.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_file(os.path.join('css', filename))

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files"""
    return send_file(os.path.join('js', filename))

# ============================================
# OTP VERIFICATION API ENDPOINTS
# ============================================

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    """
    Send OTP to user's email
    Expected JSON: { "email": "user@example.com", "userId": "user123", "fullName": "John Doe" }
    """
    try:
        data = request.json
        email = data.get('email')
        user_id = data.get('userId')
        full_name = data.get('fullName', 'User')
        
        if not email or not user_id:
            return jsonify({"success": False, "error": "Email and userId required"}), 400
        
        # Generate OTP
        code = generate_otp()
        expiry = int(time.time()) + 600  # 10 minutes from now
        
        print(f"[SEND-OTP] Generated code: '{code}' for userId: {user_id}")
        print(f"[SEND-OTP] Code type: {type(code)}, Code length: {len(code)}")
        
        # Save OTP to Firestore
        db.collection('verificationCodes').document(user_id).set({
            'code': code,
            'email': email,
            'expiry': expiry,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'verified': False
        })
        
        print(f"[SEND-OTP] Saved to Firestore for userId: {user_id}")
        
        # Send email via Brevo
        sender_email = os.getenv("SENDER_EMAIL", "noreply@cashclash.com")
        
        email_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
                .container {{ background-color: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }}
                .header {{ color: #FFA500; font-size: 24px; font-weight: bold; margin-bottom: 20px; }}
                .otp-code {{ font-size: 32px; font-weight: bold; color: #1a1a2e; letter-spacing: 5px; margin: 20px 0; }}
                .message {{ color: #666; line-height: 1.6; }}
                .footer {{ margin-top: 20px; color: #999; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">CashClash</div>
                <p class="message">Hi {full_name},</p>
                <p class="message">Your verification code is:</p>
                <div class="otp-code">{code}</div>
                <p class="message">This code will expire in 10 minutes.</p>
                <p class="message">If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                    <p>© 2025 CashClash. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        email_obj = SendSmtpEmail(
            to=[{"email": email, "name": full_name}],
            sender={"email": sender_email, "name": "CashClash"},
            subject="Your CashClash Verification Code",
            html_content=email_content
        )
        
        brevo_api.send_transac_email(email_obj)
        
        return jsonify({
            "success": True,
            "message": "OTP sent successfully"
        }), 200
        
    except Exception as e:
        print(f"Error sending OTP: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to send OTP: {str(e)}"
        }), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    """
    Verify OTP code
    Expected JSON: { "userId": "user123", "code": "123456" }
    """
    try:
        data = request.json
        print(f"[VERIFY-OTP] Received request data: {data}")
        
        user_id = data.get('userId')
        code = data.get('code')
        
        print(f"[VERIFY-OTP] userId: {user_id}, code: {code}")
        
        if not user_id or not code:
            print("[VERIFY-OTP] Missing userId or code")
            return jsonify({"success": False, "error": "userId and code required"}), 400
        
        # Get OTP from Firestore
        doc = db.collection('verificationCodes').document(user_id).get()
        
        if not doc.exists:
            print(f"[VERIFY-OTP] No document found for userId: {user_id}")
            return jsonify({
                "success": False,
                "error": "No verification code found"
            }), 404
        
        otp_data = doc.to_dict()
        print(f"[VERIFY-OTP] Stored OTP data: {otp_data}")
        print(f"[VERIFY-OTP] Stored code: '{otp_data['code']}', Received code: '{code}'")
        print(f"[VERIFY-OTP] Code match: {otp_data['code'] == code}")
        print(f"[VERIFY-OTP] Stored code type: {type(otp_data['code'])}, Received code type: {type(code)}")
        
        # Check if code matches
        if otp_data['code'] != code:
            print(f"[VERIFY-OTP] Code mismatch! Stored: '{otp_data['code']}', Received: '{code}'")
            return jsonify({
                "success": False,
                "error": "Invalid verification code"
            }), 400
            return jsonify({
                "success": False,
                "error": "Invalid verification code"
            }), 400
        
        # Check if code expired
        current_time = int(time.time())
        if current_time > otp_data['expiry']:
            return jsonify({
                "success": False,
                "error": "Verification code expired. Please request a new one."
            }), 400
        
        # Mark as verified
        db.collection('verificationCodes').document(user_id).update({
            'verified': True,
            'verifiedAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            "success": True,
            "message": "Email verified successfully"
        }), 200
        
    except Exception as e:
        print(f"Error verifying OTP: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to verify OTP: {str(e)}"
        }), 500

@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    """
    Resend OTP to user's email
    Expected JSON: { "email": "user@example.com", "userId": "user123", "fullName": "John Doe" }
    """
    return send_otp()

@app.route('/api/check-verification', methods=['POST'])
def check_verification():
    """
    Check if user's email is verified
    Expected JSON: { "userId": "user123" }
    """
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"success": False, "error": "userId required"}), 400
        
        doc = db.collection('verificationCodes').document(user_id).get()
        
        if not doc.exists:
            return jsonify({
                "success": False,
                "verified": False,
                "error": "No verification record found"
            }), 404
        
        otp_data = doc.to_dict()
        
        return jsonify({
            "success": True,
            "verified": otp_data.get('verified', False)
        }), 200
        
    except Exception as e:
        print(f"Error checking verification: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to check verification: {str(e)}"
        }), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": int(time.time())
    }), 200

@app.route('/api/debug-otp/<user_id>', methods=['GET'])
def debug_otp(user_id):
    """Debug endpoint to see what's stored for a userId"""
    try:
        doc = db.collection('verificationCodes').document(user_id).get()
        if doc.exists:
            data = doc.to_dict()
            current_time = int(time.time())
            return jsonify({
                "found": True,
                "userId": user_id,
                "code": data.get('code'),
                "code_type": str(type(data.get('code'))),
                "code_length": len(str(data.get('code'))),
                "email": data.get('email'),
                "expiry": data.get('expiry'),
                "current_time": current_time,
                "expired": current_time > data.get('expiry', 0),
                "verified": data.get('verified', False)
            })
        else:
            return jsonify({"found": False, "userId": user_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    # Debug mode should be False in production
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
