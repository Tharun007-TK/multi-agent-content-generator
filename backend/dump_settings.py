from app.core.config import settings

def dump_settings():
    print(f"--- In-Memory Settings Check ---")
    print(f"SMTP_HOST: {settings.SMTP_HOST}")
    print(f"SMTP_PORT: {settings.SMTP_PORT}")
    print(f"SMTP_USERNAME: {settings.SMTP_USERNAME}")
    password_len = len(settings.SMTP_PASSWORD) if settings.SMTP_PASSWORD else 0
    print(f"SMTP_PASSWORD Length: {password_len}")
    if settings.SMTP_PASSWORD:
        print(f"SMTP_PASSWORD (First 2 chars): {settings.SMTP_PASSWORD[:2]}...")
    else:
        print("SMTP_PASSWORD is None or Empty")

if __name__ == "__main__":
    dump_settings()
