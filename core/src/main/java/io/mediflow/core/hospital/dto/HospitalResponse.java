package io.mediflow.core.hospital.dto;

import io.mediflow.core.hospital.entity.Hospital;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class HospitalResponse {

    private Long   id;
    private String nameKr;
    private String nameJa;
    private String clinicType;
    private String specialty;
    private String plan;
    private String status;
    private String managerName;
    private String managerEmail;
    private LocalDate contractStart;
    private LocalDate contractExpire;
    private String siteUrl;
    private String phone;
    private String address;
    private String hours;
    private String lineId;
    private String instagramId;
    private LocalDateTime createdAt;

    public static HospitalResponse from(Hospital h) {
        return HospitalResponse.builder()
                .id(h.getId())
                .nameKr(h.getNameKr())
                .nameJa(h.getNameJa())
                .clinicType(h.getClinicType())
                .specialty(h.getSpecialty())
                .plan(h.getPlan())
                .status(h.getStatus())
                .managerName(h.getManagerName())
                .managerEmail(h.getManagerEmail())
                .contractStart(h.getContractStart())
                .contractExpire(h.getContractExpire())
                .siteUrl(h.getSiteUrl())
                .phone(h.getPhone())
                .address(h.getAddress())
                .hours(h.getHours())
                .lineId(h.getLineId())
                .instagramId(h.getInstagramId())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
