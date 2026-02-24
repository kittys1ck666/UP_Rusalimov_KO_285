using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace UP_CONDI_V5.Models;

[Keyless]
[Table("requests")]
public partial class Request
{
    [Column("requestID")]
    public int? RequestId { get; set; }

    [Column("startDate")]
    [StringLength(50)]
    public string? StartDate { get; set; }

    [Column("climateTechType")]
    [StringLength(50)]
    public string? ClimateTechType { get; set; }

    [Column("climateTechModel")]
    [StringLength(50)]
    public string? ClimateTechModel { get; set; }

    [Column("problemDescryption")]
    [StringLength(128)]
    public string? ProblemDescryption { get; set; }

    [Column("requestStatus")]
    [StringLength(50)]
    public string? RequestStatus { get; set; }

    [Column("completionDate")]
    [StringLength(50)]
    public string? CompletionDate { get; set; }

    [Column("repairParts")]
    [StringLength(50)]
    public string? RepairParts { get; set; }

    [Column("masterID")]
    [StringLength(50)]
    public string? MasterId { get; set; }

    [Column("clientID")]
    public int? ClientId { get; set; }
}
