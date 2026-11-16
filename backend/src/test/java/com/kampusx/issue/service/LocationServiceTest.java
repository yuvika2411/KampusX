package com.kampusx.issue.service;

import com.kampusx.issue.dto.LocationResponse;
import com.kampusx.issue.entity.Location;
import com.kampusx.issue.entity.LocationType;
import com.kampusx.issue.repository.LocationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private LocationService locationService;

    @Test
    void getAllLocations_ordersByTypeThenName() {
        LocationType hostelType = new LocationType();
        hostelType.setId(1L);
        hostelType.setName("BOYS_HOSTEL");

        LocationType blockType = new LocationType();
        blockType.setId(2L);
        blockType.setName("BLOCK");

        Location loc1 = new Location();
        loc1.setId(10L);
        loc1.setName("Tagore Hostel");
        loc1.setLocationType(hostelType);

        Location loc2 = new Location();
        loc2.setId(11L);
        loc2.setName("Aryabhatt Hostel");
        loc2.setLocationType(hostelType);

        Location loc3 = new Location();
        loc3.setId(12L);
        loc3.setName("B Block");
        loc3.setLocationType(blockType);

        when(locationRepository.findAll()).thenReturn(List.of(loc1, loc2, loc3));

        List<LocationResponse> responses = locationService.getAllLocations();

        assertThat(responses).hasSize(3);
        // "BLOCK" comes before "BOYS_HOSTEL"
        assertThat(responses.get(0).getName()).isEqualTo("B Block");
        assertThat(responses.get(0).getLocationType()).isEqualTo("BLOCK");

        // Within "BOYS_HOSTEL", "Aryabhatt Hostel" comes before "Tagore Hostel"
        assertThat(responses.get(1).getName()).isEqualTo("Aryabhatt Hostel");
        assertThat(responses.get(1).getLocationType()).isEqualTo("BOYS_HOSTEL");

        assertThat(responses.get(2).getName()).isEqualTo("Tagore Hostel");
        assertThat(responses.get(2).getLocationType()).isEqualTo("BOYS_HOSTEL");
    }
}
