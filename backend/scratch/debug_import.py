import sys
import os
sys.path.append(os.getcwd())
try:
    from services.subject_service import get_all_subjects
    print("Import successful")
    print(f"Functions in subject_service: {dir(__import__('services.subject_service', fromlist=['']).subject_service)}")
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
