package io.mediflow.core.common.exception;

/** 한 병원이 다른 병원의 데이터에 접근할 때 던지는 예외 (CLAUDE.md 4-1 규칙) */
public class TenantAccessDeniedException extends RuntimeException {
    public TenantAccessDeniedException() {
        super("다른 병원의 데이터에 접근할 수 없습니다.");
    }
}
