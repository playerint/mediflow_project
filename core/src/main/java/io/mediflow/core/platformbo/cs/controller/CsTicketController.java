package io.mediflow.core.platformbo.cs.controller;

import io.mediflow.core.platformbo.cs.dto.CreateCsTicketRequest;
import io.mediflow.core.platformbo.cs.dto.CsTicketDto;
import io.mediflow.core.platformbo.cs.service.CsTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/platform/cs/tickets")
@RequiredArgsConstructor
public class CsTicketController {

    private final CsTicketService csTicketService;

    /** GET /api/v1/platform/cs/tickets?status=... — 전체 또는 상태별 목록 */
    @GetMapping
    public ResponseEntity<List<CsTicketDto>> getAll(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(csTicketService.getAll(status));
    }

    /** PATCH /api/v1/platform/cs/tickets/{id}/status — 상태 변경 */
    @PatchMapping("/{id}/status")
    public ResponseEntity<CsTicketDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(csTicketService.updateStatus(id, body.get("status")));
    }

    /** POST /api/v1/platform/cs/tickets — 새 티켓 생성 */
    @PostMapping
    public ResponseEntity<CsTicketDto> create(@RequestBody CreateCsTicketRequest request) {
        return ResponseEntity.ok(csTicketService.create(request));
    }
}
