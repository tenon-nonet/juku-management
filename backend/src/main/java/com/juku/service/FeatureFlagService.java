package com.juku.service;

import com.juku.entity.FeatureFlag;
import com.juku.repository.FeatureFlagRepository;
import com.juku.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeatureFlagService {

    private final FeatureFlagRepository featureFlagRepository;
    private final StaffRepository staffRepository;

    public boolean isEnabled(String featureKey) {
        return featureFlagRepository.findByFeatureKey(featureKey)
                .map(FeatureFlag::getIsEnabled)
                .orElse(false);
    }

    public List<FeatureFlag> getAll() {
        return featureFlagRepository.findAll();
    }

    @Transactional
    public FeatureFlag update(String featureKey, boolean enabled, String updatedByUsername) {
        FeatureFlag flag = featureFlagRepository.findByFeatureKey(featureKey)
                .orElseThrow(() -> new RuntimeException("Feature flag not found: " + featureKey));
        flag.setIsEnabled(enabled);
        staffRepository.findByUsername(updatedByUsername).ifPresent(flag::setUpdatedBy);
        return featureFlagRepository.save(flag);
    }
}
