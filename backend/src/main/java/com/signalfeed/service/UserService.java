package com.signalfeed.service;

import com.signalfeed.config.JwtService;
import com.signalfeed.dto.AuthResponse;
import com.signalfeed.dto.LoginRequest;
import com.signalfeed.dto.RegisterRequest;
import com.signalfeed.dto.UserProfile;
import com.signalfeed.model.User;
import com.signalfeed.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadCredentialsException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadCredentialsException("Username already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(mapToProfile(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(mapToProfile(user))
                .build();
    }

    public UserProfile getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return mapToProfile(user);
    }

    private UserProfile mapToProfile(User user) {
        return UserProfile.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
