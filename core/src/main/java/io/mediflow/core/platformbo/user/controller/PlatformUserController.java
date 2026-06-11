package io.mediflow.core.platformbo.user.controller;

import io.mediflow.core.platformbo.user.dto.PlatformUserDto;
import io.mediflow.core.platformbo.user.dto.UpdateProfileRequest;
import io.mediflow.core.platformbo.user.service.PlatformUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/platform/users")
@RequiredArgsConstructor
public class PlatformUserController {

    private final PlatformUserService platformUserService;

    /** GET /api/v1/platform/users/me — 현재 사용자 정보 조회 */
    @GetMapping("/me")
    public ResponseEntity<PlatformUserDto> getMe(Authentication authentication) {
        return ResponseEntity.ok(platformUserService.getMe(authentication.getName()));
    }

    /** PUT /api/v1/platform/users/me — 현재 사용자 프로필 수정 */
    @PutMapping("/me")
    public ResponseEntity<PlatformUserDto> updateMe(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(platformUserService.updateMe(authentication.getName(), request));
    }

    /** GET /api/v1/platform/users/ — 본사 팀 멤버 목록 */
    @GetMapping
    public ResponseEntity<List<PlatformUserDto>> getTeamMembers() {
        return ResponseEntity.ok(platformUserService.getTeamMembers());
    }
}
