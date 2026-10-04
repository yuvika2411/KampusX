package com.kampusx.issue.config;

import com.kampusx.issue.entity.Location;
import com.kampusx.issue.entity.LocationType;
import com.kampusx.issue.repository.LocationRepository;
import com.kampusx.issue.repository.LocationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LocationDataInitializer implements CommandLineRunner {

    private final LocationTypeRepository locationTypeRepository;
    private final LocationRepository locationRepository;

    @Override
    public void run(String... args) {

        LocationType boysHostel = createLocationType("BOYS_HOSTEL");
        LocationType girlsHostel = createLocationType("GIRLS_HOSTEL");
        LocationType block = createLocationType("BLOCK");
        LocationType foodOutlet = createLocationType("FOOD_OUTLET");
        LocationType lab = createLocationType("LAB");
        LocationType wifi = createLocationType("WIFI");
        LocationType otherFacility = createLocationType("OTHER_FACILITY");

        // Boys Hostels
        createLocation("C. V. Raman Hostel", boysHostel);
        createLocation("Aryabhatt Hostel", boysHostel);
        createLocation("Tagore Hostel", boysHostel);
        createLocation("Vivekanand Hostel", boysHostel);
        createLocation("Chandragupt Hostel", boysHostel);
        createLocation("Chanakya Hostel", boysHostel);
        createLocation("Abhimanyu Hostel", boysHostel);

        // Girls Hostels
        createLocation("Gargi Hostel", girlsHostel);
        createLocation("Sarojni Hostel", girlsHostel);
        createLocation("Saraswati Hostel", girlsHostel);

        // Blocks
        createLocation("A Block", block);
        createLocation("B Block", block);
        createLocation("C Block", block);
        createLocation("D Block", block);
        createLocation("E Block", block);
        createLocation("F Block", block);
        createLocation("G Block", block);
        createLocation("H Block", block);

        // Food Outlets
        createLocation("Cafeteria", foodOutlet);
        createLocation("Nescafe", foodOutlet);
        createLocation("Healthy Hut", foodOutlet);
        createLocation("Hungry Nites", foodOutlet);
        createLocation("Big Treats", foodOutlet);
        createLocation("Multiplex Complex", foodOutlet);

        // Labs
        createLocation("HP-Intel AI Skills Lab", lab);
        createLocation("Apple iOS Learning Centre of Excellence (Mac Lab)", lab);
        createLocation("Centre of Excellence for Supercomputing", lab);
        createLocation("Wipro Centre of Excellence in Cyber Security", lab);
        createLocation("AICTE IDEA Lab", lab);
        createLocation("Centre for Automotive Mechatronics", lab);
        createLocation("Festo Centre of Excellence", lab);
        createLocation("Centre of Excellence for Quantum Computing", lab);
        createLocation("Centre for E-Mobility & Power Systems", lab);
        createLocation("Advanced Woodworking Centre", lab);

        // WiFi
        createLocation("Campus WIFI", wifi);
        createLocation("C. V. Raman Hostel WIFI", wifi);
        createLocation("Aryabhatt Hostel WIFI", wifi);
        createLocation("Tagore Hostel WIFI", wifi);
        createLocation("Vivekanand Hostel WIFI", wifi);
        createLocation("Chandragupt Hostel WIFI", wifi);
        createLocation("Chanakya Hostel WIFI", wifi);
        createLocation("Abhimanyu Hostel WIFI", wifi);
        createLocation("Gargi Hostel WIFI", wifi);
        createLocation("Sarojni Hostel WIFI", wifi);
        createLocation("Saraswati Hostel WIFI", wifi);

        // Other Facilities
        createLocation("Washroom", otherFacility);
        createLocation("Parking", otherFacility);
        createLocation("Medical Room", otherFacility);
        createLocation("Sports", otherFacility);
        createLocation("Library", otherFacility);
    }

    private LocationType createLocationType(String name) {

        return locationTypeRepository.findAll()
                .stream()
                .filter(type -> type.getName().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    LocationType type = new LocationType();
                    type.setName(name);
                    return locationTypeRepository.save(type);
                });
    }

    private void createLocation(String name, LocationType locationType) {

        boolean exists = locationRepository.findAll()
                .stream()
                .anyMatch(location ->
                        location.getName().equals(name)
                );

        if (!exists) {
            Location location = new Location();
            location.setName(name);
            location.setLocationType(locationType);

            locationRepository.save(location);
        }
    }
}