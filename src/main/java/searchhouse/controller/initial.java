package controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class initial {

    @GetMapping("/hello")
    public String hello() {
        return "forward:/index.html";
    }
}