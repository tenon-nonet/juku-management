package com.juku.security;

import com.juku.repository.GuardianRepository;
import com.juku.repository.StaffRepository;
import com.juku.repository.StudentRepository;
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
    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Try staff first
        var staffOpt = staffRepository.findByUsername(username);
        if (staffOpt.isPresent()) {
            var staff = staffOpt.get();
            if (!staff.isActive()) {
                throw new UsernameNotFoundException("Account is disabled: " + username);
            }
            return new org.springframework.security.core.userdetails.User(
                    staff.getUsername(),
                    staff.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_" + staff.getRole().name()))
            );
        }

        // 2. Try student
        var studentOpt = studentRepository.findByUsername(username);
        if (studentOpt.isPresent()) {
            var student = studentOpt.get();
            if (student.getPassword() == null) {
                throw new UsernameNotFoundException("Student has no password set: " + username);
            }
            return new org.springframework.security.core.userdetails.User(
                    student.getUsername(),
                    student.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
            );
        }

        // 3. Try guardian
        var guardianOpt = guardianRepository.findByUsername(username);
        if (guardianOpt.isPresent()) {
            var guardian = guardianOpt.get();
            if (guardian.getPassword() == null) {
                throw new UsernameNotFoundException("Guardian has no password set: " + username);
            }
            return new org.springframework.security.core.userdetails.User(
                    guardian.getUsername(),
                    guardian.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_GUARDIAN"))
            );
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}
