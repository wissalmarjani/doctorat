package ma.enset.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String requestURI = request.getRequestURI();
        final String method = request.getMethod();

        log.info("🔐 ════════════════════════════════════════════════");
        log.info("🔐 JwtFilter - {} {}", method, requestURI);

        // Récupérer le header Authorization
        final String authHeader = request.getHeader("Authorization");
        log.info("🔐 JwtFilter - Auth Header present: {}", authHeader != null);

        // Vérifier si le header existe et commence par "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("🔐 JwtFilter - ⚠️ No Bearer token found, continuing without auth");
            filterChain.doFilter(request, response);
            return;
        }

        // Extraire le token (enlever "Bearer ")
        final String jwt = authHeader.substring(7);
        log.info("🔐 JwtFilter - Token extracted (length: {})", jwt.length());

        try {
            // Extraire le username du token
            final String username = jwtService.extractUsername(jwt);
            log.info("🔐 JwtFilter - Username from token: {}", username);

            // Si username existe et pas encore authentifié
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.info("🔐 JwtFilter - Loading user details for: {}", username);

                // Charger les détails de l'utilisateur
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                log.info("🔐 JwtFilter - User loaded: {}", userDetails.getUsername());
                log.info("🔐 JwtFilter - User authorities: {}", userDetails.getAuthorities());
                log.info("🔐 JwtFilter - User enabled: {}", userDetails.isEnabled());

                // Valider le token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    log.info("🔐 JwtFilter - ✅ Token is VALID");

                    // Créer l'objet d'authentification
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Mettre à jour le SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.info("🔐 JwtFilter - ✅ Authentication set in SecurityContext");
                    log.info("🔐 JwtFilter - ✅ Authorities in context: {}",
                            SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                } else {
                    log.warn("🔐 JwtFilter - ❌ Token is INVALID");
                }
            } else {
                log.info("🔐 JwtFilter - Already authenticated or no username");
            }
        } catch (Exception e) {
            log.error("🔐 JwtFilter - ❌ Exception: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            e.printStackTrace();
        }

        log.info("🔐 ════════════════════════════════════════════════");
        filterChain.doFilter(request, response);
    }
}