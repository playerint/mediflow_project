import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.vector_db import Base, engine
from sqlalchemy.orm import Session
from app.services import rag_service

Base.metadata.create_all(engine)

with Session(engine) as db:
    rag_service.add_knowledge(
        db=db,
        hospital_id=1,
        category="treatment",
        title="쌍꺼풀 수술",
        content="쌍꺼풀 수술은 절개법과 비절개법이 있으며 회복 기간은 약 1-2주입니다. 가격은 100만원~200만원 선입니다.",
    )
    print("등록 완료!")
