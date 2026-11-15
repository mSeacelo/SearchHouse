package searchhouse.reserva;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(ReservaController.class)
class ReservaControllerTest {

    @Autowired MockMvc mvc;
    @MockBean ReservaService service;

    @Test
    void listarDevolveOsHorarios() throws Exception {
        when(service.listar()).thenReturn(List.of(
                new ReservaVisita("Republica Kalango", LocalDateTime.of(2026, 11, 20, 14, 0))));

        mvc.perform(get("/api/reservas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].imovelTitulo").value("Republica Kalango"))
                .andExpect(jsonPath("$[0].disponivel").value(true));
    }

    @Test
    void reservarDevolveHorarioOcupado() throws Exception {
        ReservaVisita r = new ReservaVisita("Republica Kalango", LocalDateTime.of(2026, 11, 20, 14, 0));
        r.reservarPara(2L);
        when(service.reservar(1L, 2L)).thenReturn(r);

        mvc.perform(put("/api/reservas/1/reservar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estudanteId\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disponivel").value(false))
                .andExpect(jsonPath("$.estudanteId").value(2));
    }

    @Test
    void reservarHorarioOcupadoDevolve409ComMensagem() throws Exception {
        when(service.reservar(1L, 2L))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Horario ja reservado"));

        mvc.perform(put("/api/reservas/1/reservar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estudanteId\":2}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Horario ja reservado"));
    }
}
