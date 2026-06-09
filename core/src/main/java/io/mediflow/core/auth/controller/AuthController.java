package io.mediflow.core.auth.controller;

import io.mediflow.core.auth.dto.LoginRequest;
import io.mediflow.core.auth.dto.LoginResponse;
import io.mediflow.core.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** POST /api/v1/auth/login — 로그인 → JWT 토큰 발급 */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /** GET /api/v1/auth/me — 현재 로그인 사용자 정보 (토큰 검증용) */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            org.springframework.security.core.Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of(
                "username",   auth.getName(),
                "role",       auth.getAuthorities().iterator().next().getAuthority(),
                "hospitalId", auth.getDetails() != null ? auth.getDetails() : "null"
        ));
    }
}
