package io.mediflow.core.hospital.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class HospitalCreateRequest {

    @NotBlank(message = "병원명(한국어)은 필수입니다.")
    private String nameKr;

    private String nameJa;

    @NotBlank(message = "진료과 유형은 필수입니다.")
    private String clinicType;

    private String specialty;

    @NotBlank(message = "플랜은 필수입니다.")
    private String plan;

    @NotBlank(message = "담당자 이름은 필수입니다.")
    private String managerName;

    @Email(message = "유효한 이메일 형식이어야 합니다.")
    @NotBlank(message = "담당자 이메일은 필수입니다.")
    private String managerEmail;

    @NotNull(message = "계약 시작일은 필수입니다.")
    private LocalDate contractStart;

    private LocalDate contractExpire;

    private String phone;
    private String address;
    private String hours;
    private String lineId;
    private String instagramId;
}
