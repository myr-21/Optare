package com.signalfeed.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret:defaultSecretKeyWithAtLeast64CharactersRequiredForSHA512HmacSigningKeyPlaceholder}")
    private String secret;

    @Value("${jwt.expiration:604800000}")
    private long jwtExpiration;

    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", String.class));
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UUID userId, String username, String email) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", userId.toString());
        extraClaims.put("email", email);
        return buildToken(extraClaims, username, jwtExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }

    public boolean isTokenValid(String token, String expectedUsername) {
        final String username = extractUsername(token);
        return (username.equals(expectedUsername)) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        try {
            // Hash the secret to ensure it is always 512 bits (64 bytes)
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            byte[] hash = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(hash);
        } catch (Exception e) {
            // Fallback to plain bytes if hashing fails
            byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            if (keyBytes.length < 64) {
                // Pad if too short to prevent crash
                byte[] paddedBytes = new byte[64];
                System.arraycopy(keyBytes, 0, paddedBytes, 0, keyBytes.length);
                return Keys.hmacShaKeyFor(paddedBytes);
            }
            return Keys.hmacShaKeyFor(keyBytes);
        }
    }
}
