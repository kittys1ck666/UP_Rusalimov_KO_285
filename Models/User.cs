using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace UP_CONDI_V5.Models;

[Keyless]
[Table("users")]
public partial class User
{
    [Column("userID")]
    public int? UserId { get; set; }

    [Column("fio")]
    [StringLength(50)]
    public string? Fio { get; set; }

    [Column("phone")]
    public long? Phone { get; set; }

    [Column("login")]
    [StringLength(50)]
    public string? Login { get; set; }

    [Column("password")]
    [StringLength(50)]
    public string? Password { get; set; }

    [Column("type")]
    [StringLength(50)]
    public string? Type { get; set; }
}
