package com.kampusx.issue.service;

import com.kampusx.issue.dto.LocationResponse;
import com.kampusx.issue.entity.Location;
import com.kampusx.issue.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationService {

    private final LocationRepository locationRepository;

    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAll()
                .stream()
                .sorted(Comparator
                        .comparing((Location loc) ->
                                loc.getLocationType() != null && loc.getLocationType().getName() != null
                                        ? loc.getLocationType().getName()
                                        : "")
                        .thenComparing(loc -> loc.getName() != null ? loc.getName() : ""))
                .map(loc -> new LocationResponse(
                        loc.getId(),
                        loc.getName(),
                        loc.getLocationType() != null ? loc.getLocationType().getName() : null
                ))
                .toList();
    }
}
