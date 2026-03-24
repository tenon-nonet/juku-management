package com.juku.security;

import com.juku.service.FeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Aspect
@Component
@RequiredArgsConstructor
public class FeatureFlagAspect {

    private final FeatureFlagService featureFlagService;

    @Before("@annotation(requiresFeature)")
    public void checkFeatureFlag(RequiresFeature requiresFeature) {
        String featureKey = requiresFeature.value();
        if (!featureFlagService.isEnabled(featureKey)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Feature '" + featureKey + "' is not enabled for this plan.");
        }
    }
}
