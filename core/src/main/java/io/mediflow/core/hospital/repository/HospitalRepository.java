package io.mediflow.core.hospital.repository;

import io.mediflow.core.hospital.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    /** 상태별 병원 목록 조회 (본사용 BO 전용) */
    List<Hospital> findByStatus(String status);

    /** 병원명 검색 (한국어) */
    List<Hospital> findByNameKrContainingIgnoreCase(String keyword);

    /** 특정 병원 ID 조회 — 존재하지 않으면 빈 Optional 반환 */
    Optional<Hospital> findById(Long id);
}
