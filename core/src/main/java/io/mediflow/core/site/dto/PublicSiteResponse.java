package io.mediflow.core.site.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

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

    // Step 5 일본어 카피
    private String japaneseCopy;
}
