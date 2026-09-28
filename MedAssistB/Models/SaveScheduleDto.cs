namespace MedAssistB.Models
{
    public class SaveScheduleDto
    {
        public int UserId { get; set; }
        public List<ShiftItemDto> Schedule { get; set; } = new();
    }

    public class ShiftItemDto
    {
        public DateTime Data { get; set; }
        public string Tura { get; set; } = string.Empty;
        public string Tip { get; set; } = string.Empty;
    }
}
