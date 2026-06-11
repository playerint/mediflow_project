package io.mediflow.core.platformbo.user.service;

import io.mediflow.core.common.exception.ResourceNotFoundException;
import io.mediflow.core.platformbo.user.dto.PlatformUserDto;
import io.mediflow.core.platformbo.user.dto.UpdateProfileRequest;
import io.mediflow.core.user.entity.User;
import io.mediflow.core.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatformUserService {

    private final UserRepository userRepository;

    /** 현재 로그인한 사용자 정보 조회 */
    @Transactional(readOnly = true)
    public PlatformUserDto getMe(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return PlatformUserDto.from(user);
    }

    /** 현재 로그인한 사용자 프로필 수정 */
    @Transactional
    public PlatformUserDto updateMe(String username, UpdateProfileRequest req) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        user.updateProfile(req.displayName(), req.phone(), req.company());
        userRepository.save(user);
        return PlatformUserDto.from(user);
    }

    /** 본사 팀 멤버 목록 (hospitalId = null 인 사용자 = 본사 직원) */
    @Transactional(readOnly = true)
    public List<PlatformUserDto> getTeamMembers() {
        return userRepository.findByHospitalIdIsNull()
                .stream()
                .map(PlatformUserDto::from)
                .toList();
    }
}
