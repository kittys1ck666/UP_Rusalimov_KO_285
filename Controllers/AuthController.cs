using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UP_CONDI_V5.Data;
using UP_CONDI_V5.Models;
using UP_CONDI_V5.Services;

namespace UP_CONDI_V5.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly PasswordHasherService _hasher;
    private readonly JwtTokenService _jwt;

    public AuthController(ApplicationDbContext db, PasswordHasherService hasher, JwtTokenService jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    // API contract stays stable regardless of DB column naming
    public sealed record RegisterRequest(string Username, string Password, string? Role);
    public sealed record LoginRequest(string Username, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Username/password required.");

        var username = req.Username.Trim();

        var exists = await _db.Set<User>()
            .AnyAsync(x => x.Login == username);

        if (exists) return Conflict("User already exists.");

        var user = new User
        {
            Login = username,

            // WARNING (school-mode): storing plaintext password.
            // If you want hashing, rename column to password_hash (or adjust generator) and re-scaffold.
            Password = req.Password,

            Type = string.IsNullOrWhiteSpace(req.Role) ? "User" : req.Role!.Trim()
        };

        _db.Set<User>().Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { id = user.UserId, username = user.Login, role = user.Type });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Username/password required.");

        var username = req.Username.Trim();

        var user = await _db.Set<User>()
            .FirstOrDefaultAsync(x => x.Login == username);

        if (user is null) return Unauthorized();


        if (!string.Equals(req.Password, user.Password, StringComparison.Ordinal))
            return Unauthorized();


        var token = _jwt.CreateToken(
            userId: user.UserId,
            username: user.Login,
            role: user.Type);

        return Ok(new { token });
    }
}