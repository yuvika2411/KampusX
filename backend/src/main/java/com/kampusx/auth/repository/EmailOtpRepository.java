package com.kampusx.auth.repository;

import com.kampusx.auth.entity.EmailOtp;
import com.kampusx.auth.entity.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findTopByEmailAndPurposeOrderByIdDesc(String email, OtpPurpose otpPurpose);
}