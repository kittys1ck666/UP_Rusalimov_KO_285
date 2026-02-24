using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace UP_CONDI_V5.Models;

[Keyless]
[Table("comments")]
public partial class Comment
{
    [Column("commentID")]
    public int? CommentId { get; set; }

    [Column("message")]
    [StringLength(50)]
    public string? Message { get; set; }

    [Column("masterID")]
    public int? MasterId { get; set; }

    [Column("requestID")]
    public int? RequestId { get; set; }
}
