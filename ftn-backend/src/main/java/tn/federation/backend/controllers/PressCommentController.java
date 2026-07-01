package tn.federation.backend.controllers;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.CommentMessageDTO;
import tn.federation.backend.dto.CommentResponseDTO;
import tn.federation.backend.entities.PressComment;
import tn.federation.backend.entities.PressItem;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.IPressItemRepository;
import tn.federation.backend.repositories.PressCommentRepository;
import tn.federation.backend.repositories.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/press-comments")
public class PressCommentController {

    @Autowired
    private PressCommentRepository commentRepository;

    @Autowired
    private IPressItemRepository pressItemRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<CommentResponseDTO> addComment(@RequestBody CommentMessageDTO message) {
        PressItem pressItem = pressItemRepository.findById(message.getPressItemId()).orElse(null);
        if (pressItem == null) return ResponseEntity.badRequest().build();

        User user = userRepository.findById(message.getUserId()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().build();

        PressComment comment = new PressComment();
        comment.setText(message.getText());
        comment.setPressItem(pressItem);
        comment.setUser(user);

        // Handle replies
        if (message.getParentCommentId() != null) {
            PressComment parent = commentRepository.findById(message.getParentCommentId()).orElse(null);
            comment.setParentComment(parent);
        }

        PressComment saved = commentRepository.save(comment);
        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping("/{pressItemId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long pressItemId) {
        List<PressComment> roots = commentRepository.findRootCommentsByPressItemId(pressItemId);
        return ResponseEntity.ok(roots.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    private CommentResponseDTO toDTO(PressComment c) {
        List<PressComment> replyEntities = commentRepository.findRepliesByParentId(c.getId());
        List<CommentResponseDTO> replies = replyEntities.isEmpty()
                ? null
                : replyEntities.stream().map(this::toFlatDTO).collect(Collectors.toList());
        return toFlatDTO(c).toBuilder().replies(replies).build();
    }

    private CommentResponseDTO toFlatDTO(PressComment c) {
        return CommentResponseDTO.builder()
                .id(c.getId())
                .text(c.getText())
                .createdAt(c.getCreatedAt())
                .userId(c.getUser() != null ? c.getUser().getId() : null)
                .userFirstName(c.getUser() != null ? c.getUser().getFirstName() : "Anonyme")
                .userLastName(c.getUser() != null ? c.getUser().getLastName() : "")
                .pressItemId(c.getPressItem() != null ? c.getPressItem().getIdPressItem() : null)
                .parentCommentId(c.getParentComment() != null ? c.getParentComment().getId() : null)
                .build();
    }
}
