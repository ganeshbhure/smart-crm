package com.smartcrm.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String company;
    private Long customerId;
}
