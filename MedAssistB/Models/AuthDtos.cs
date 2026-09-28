namespace MedAssistB.Models;

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Parola { get; set; } = string.Empty;
}

public class ResetPasswordRequestDto
{
    public string Email { get; set; } = string.Empty;
}
