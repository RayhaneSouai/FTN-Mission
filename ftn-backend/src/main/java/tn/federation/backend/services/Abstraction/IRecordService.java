package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dtos.RecordDTO; import tn.federation.backend.entities.Gender; import tn.federation.backend.entities.StrokeType; import java.util.List; public interface IRecordService { List<RecordDTO> getPersonalRecords(Long swimmerId); List<RecordDTO> getAllNationalRecords(); RecordDTO getNationalRecordForEvent(Integer distance, StrokeType stroke, Gender gender); }
