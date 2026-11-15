package searchhouse.reserva;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import searchhouse.estudante.EstudanteRepository;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock ReservaVisitaRepository reservas;
    @Mock EstudanteRepository estudantes;
    @InjectMocks ReservaService service;

    private ReservaVisita horarioLivre() {
        return new ReservaVisita("Republica Kalango", LocalDateTime.of(2026, 11, 20, 14, 0));
    }

    @Test
    void reservarHorarioDisponivelOcupaOHorario() {
        ReservaVisita r = horarioLivre();
        when(reservas.buscarParaAtualizar(1L)).thenReturn(Optional.of(r));
        when(estudantes.existsById(2L)).thenReturn(true);

        ReservaVisita resultado = service.reservar(1L, 2L);

        assertFalse(resultado.isDisponivel());
        assertEquals(2L, resultado.getEstudanteId());
    }

    @Test
    void reservarHorarioJaReservadoRetorna409() {
        ReservaVisita r = horarioLivre();
        r.reservarPara(3L);
        when(reservas.buscarParaAtualizar(1L)).thenReturn(Optional.of(r));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.reservar(1L, 2L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals(3L, r.getEstudanteId()); // quem já reservou continua com o horário
    }

    @Test
    void reservarComEstudanteInexistenteRetorna404() {
        when(reservas.buscarParaAtualizar(1L)).thenReturn(Optional.of(horarioLivre()));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.reservar(1L, 99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void cancelarReservaLiberaOHorario() {
        ReservaVisita r = horarioLivre();
        r.reservarPara(2L);
        when(reservas.buscarParaAtualizar(1L)).thenReturn(Optional.of(r));

        ReservaVisita resultado = service.cancelar(1L);

        assertTrue(resultado.isDisponivel());
        assertNull(resultado.getEstudanteId());
    }
}
