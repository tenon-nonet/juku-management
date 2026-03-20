package com.juku.security;

import com.juku.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final StaffRepository staffRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var staff = staffRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Staff not found: " + username));

        return new org.springframework.security.core.userdetails.User(
                staff.getUsername(),
                staff.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + staff.getRole().name()))
        );
    }
}
