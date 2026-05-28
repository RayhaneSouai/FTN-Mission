package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.federation.backend.repositories.IPressItemRepository;
import tn.federation.backend.entities.PressItem;
import java.util.List;

@RestController
@RequestMapping("/api/debug")
public class DebugController {
    @Autowired
    IPressItemRepository repo;

    @GetMapping("/db-dump")
    public List<PressItem> dump() {
        return repo.findAll();
    }
}
