package io.mediflow.core.common.config;

import io.mediflow.core.user.entity.User;
import io.mediflow.core.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 앱 시작 시 개발용 기본 계정을 자동 생성한다.
 * 이미 존재하면 건너뜀.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        createIfAbsent("admin@mediflow.io",   "admin1234",    "SUPER",          null);
        createIfAbsent("ops@mediflow.io",     "ops1234",      "OPS",            null);
        createIfAbsent("finance@mediflow.io", "finance1234",  "FINANCE",        null);
        createIfAbsent("h1@mediflow.io",      "hospital1234", "HOSPITAL_ADMIN", 1L);
        createIfAbsent("h2@mediflow.io",      "hospital1234", "HOSPITAL_ADMIN", 2L);
        log.info("=== 개발용 기본 계정 초기화 완료 ===");
    }

    private void createIfAbsent(String username, String rawPw, String role, Long hospitalId) {
        if (!userRepository.existsByUsername(username)) {
            userRepository.save(User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(rawPw))
                    .role(role)
                    .hospitalId(hospitalId)
                    .build());
            log.info("계정 생성: {} ({})", username, role);
        }
    }
}
