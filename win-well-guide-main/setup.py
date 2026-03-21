"""
Setup script to help configure the Store Analyzer
"""

import os
from pathlib import Path

def create_env_file():
    """Create .env file from template if it doesn't exist"""
    env_path = Path(".env")
    env_example_path = Path(".env.example")
    
    if env_path.exists():
        print("[OK] .env file already exists")
        return
    
    if env_example_path.exists():
        # Copy example to .env
        with open(env_example_path, 'r') as f:
            content = f.read()
        
        with open(env_path, 'w') as f:
            f.write(content)
        
        print("[OK] Created .env file from .env.example")
        print("[!] Please edit .env and add your OPENAI_API_KEY")
    else:
        # Create basic .env file
        env_content = """# OpenAI API Key - Required for LangChain agent
# Get your key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# API Server Port (default: 8000)
PORT=8000

# Frontend API URL (for React app)
VITE_API_URL=http://localhost:8000
"""
        with open(env_path, 'w') as f:
            f.write(env_content)
        
        print("[OK] Created .env file")
        print("[!] Please edit .env and add your OPENAI_API_KEY")

def check_openai_key():
    """Check if OpenAI API key is set"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    if api_key and api_key != "your_openai_api_key_here":
        print("[OK] OPENAI_API_KEY is set")
        return True
    else:
        print("[X] OPENAI_API_KEY is not set")
        print("\nTo get your OpenAI API key:")
        print("   1. Go to https://platform.openai.com/api-keys")
        print("   2. Sign up or log in")
        print("   3. Click 'Create new secret key'")
        print("   4. Copy the key and add it to your .env file")
        print("\n   Or see GET_OPENAI_KEY.md for detailed instructions")
        return False

def main():
    print("=" * 60)
    print("Store Analyzer Setup")
    print("=" * 60)
    print()
    
    # Create .env file
    create_env_file()
    print()
    
    # Check OpenAI key
    has_key = check_openai_key()
    print()
    
    if has_key:
        print("=" * 60)
        print("[OK] Setup complete! You can now run the API:")
        print("   python run_api.py")
        print("=" * 60)
    else:
        print("=" * 60)
        print("[!] Setup incomplete. Please add your OpenAI API key to .env")
        print("=" * 60)

if __name__ == "__main__":
    main()

