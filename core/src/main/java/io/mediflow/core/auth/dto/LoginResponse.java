package io.mediflow.core.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String role;
    private Long   hospitalId;  // hospital-bo 사용자만 값 있음, platform-bo는 null
}
