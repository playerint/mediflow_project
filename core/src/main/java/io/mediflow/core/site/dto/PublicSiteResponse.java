package io.mediflow.core.site.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class PublicSiteResponse {

    private Long         id;
    private String       nameKr;
    private String       nameJa;
    private String       clinicType;
    private String       specialty;
    private String       phone;
    private String       address;
    private String       hours;
    private String       lineId;
    private String       instagramId;
    private String       siteUrl;

    // Step 1 분석 결과
    private List<String> specialties;
    private List<String> suggestedKeywordsJa;

    // Step 1 FAQ
    private List<Map<String,Object>> faqs;

    // Step 2 의료진·시술·후기
    private List<Map<String,Object>> doctors;
    private List<Map<String,Object>> treatments;
    private List<Map<String,Object>> reviews;

    // Step 5 일본어 카피
    private String japaneseCopy;
}
