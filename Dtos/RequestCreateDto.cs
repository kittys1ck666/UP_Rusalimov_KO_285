namespace UP_CONDI_V5.Dtos;

public sealed class RequestCreateDto
{
    public string StartDate { get; set; }
    public string ClimateTechType { get; set; }
    public string ClimateTechModel { get; set; }
    public string ProblemDescryption { get; set; }
    public string RequestStatus { get; set; }
    public string CompletionDate { get; set; }
    public string RepairParts { get; set; }
    public string MasterId { get; set; }
    public int? ClientId { get; set; }
}
