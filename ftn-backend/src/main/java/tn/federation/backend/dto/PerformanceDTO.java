package tn.federation.backend.dto;

import tn.federation.backend.entities.StrokeType;

import java.time.LocalDate;

public class PerformanceDTO {
    private Long id;
    private Double time;
    private Integer distance;
    private StrokeType stroke;
    private LocalDate date;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getTime() {
        return time;
    }

    public void setTime(Double time) {
        this.time = time;
    }

    public Integer getDistance() {
        return distance;
    }

    public void setDistance(Integer distance) {
        this.distance = distance;
    }

    public StrokeType getStroke() {
        return stroke;
    }

    public void setStroke(StrokeType stroke) {
        this.stroke = stroke;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
