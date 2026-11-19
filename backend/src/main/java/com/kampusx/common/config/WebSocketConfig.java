package com.kampusx.common.config;

import com.kampusx.auth.service.JwtService;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Raw WebSocket endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        // SockJS fallback endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null) {
                    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                        authenticateConnection(accessor);
                    } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                        authorizeSubscription(accessor);
                    }
                }
                return message;
            }
        });
    }

    private void authenticateConnection(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            token = accessor.getFirstNativeHeader("token");
        }

        if (token != null && !token.isBlank()) {
            try {
                String email = jwtService.extractEmail(token);
                if (email != null) {
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null && user.isActive() && jwtService.isTokenValid(token, user.getEmail())) {
                        SimpleGrantedAuthority authority =
                                new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        user.getEmail(),
                                        null,
                                        List.of(authority)
                                );
                        accessor.setUser(authentication);
                        log.info("WebSocket connected user: {} (role: {})", email, user.getRole());
                    }
                }
            } catch (Exception ex) {
                log.warn("WebSocket authentication error: {}", ex.getMessage());
            }
        }
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        String destination = accessor.getDestination();

        if (destination != null) {
            if (destination.startsWith("/topic/admin")) {
                if (principal == null || !hasAuthority(principal, "ROLE_ADMIN")) {
                    log.warn("Unauthorized attempt to subscribe to {} by {}", destination,
                            principal != null ? principal.getName() : "anonymous");
                    throw new AccessDeniedException("Access denied: ADMIN role required");
                }
            } else if (destination.startsWith("/topic/categories/")) {
                if (principal == null || (!hasAuthority(principal, "ROLE_CATEGORY_HEAD") && !hasAuthority(principal, "ROLE_ADMIN"))) {
                    log.warn("Unauthorized attempt to subscribe to {} by {}", destination,
                            principal != null ? principal.getName() : "anonymous");
                    throw new AccessDeniedException("Access denied: CATEGORY_HEAD or ADMIN role required");
                }
            }
        }
    }

    private boolean hasAuthority(Principal principal, String role) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            return auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equalsIgnoreCase(role));
        }
        return false;
    }
}
