using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;

using Microsoft.AspNetCore.Authorization;


using UP_CONDI_V5.Data;
using UP_CONDI_V5.Models;
using UP_CONDI_V5.Dtos;

namespace UP_CONDI_V5.Controllers;

[ApiController]
[Route("api/[controller]")]

[Authorize]

public class RequestController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public RequestController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.Set<Request>()
            .AsNoTracking()
            .Select(x => new RequestDto
            {

                RequestId = x.RequestId,

                StartDate = x.StartDate,

                ClimateTechType = x.ClimateTechType,

                ClimateTechModel = x.ClimateTechModel,

                ProblemDescription = x.ProblemDescription,

                RequestStatus = x.RequestStatus,

                CompletionDate = x.CompletionDate,

                RepairParts = x.RepairParts,

                MasterId = x.MasterId,

                ClientId = x.ClientId,

            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _db.Set<Request>()
            .AsNoTracking()
            .Where(x => x.RequestId == id)
            .Select(x => new RequestDto
            {

                RequestId = x.RequestId,

                StartDate = x.StartDate,

                ClimateTechType = x.ClimateTechType,

                ClimateTechModel = x.ClimateTechModel,

                ProblemDescription = x.ProblemDescription,

                RequestStatus = x.RequestStatus,

                CompletionDate = x.CompletionDate,

                RepairParts = x.RepairParts,

                MasterId = x.MasterId,

                ClientId = x.ClientId,

            })
            .FirstOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RequestCreateDto dto)
    {
        var entity = new Request
        {




            StartDate = dto.StartDate,



            ClimateTechType = dto.ClimateTechType,



            ClimateTechModel = dto.ClimateTechModel,



            ProblemDescription = dto.ProblemDescription,



            RequestStatus = dto.RequestStatus,



            CompletionDate = dto.CompletionDate,



            RepairParts = dto.RepairParts,



            MasterId = dto.MasterId,



            ClientId = dto.ClientId,


        };

        _db.Set<Request>().Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new RequestDto
        {

            RequestId = entity.RequestId,

            StartDate = entity.StartDate,

            ClimateTechType = entity.ClimateTechType,

            ClimateTechModel = entity.ClimateTechModel,

            ProblemDescription = entity.ProblemDescription,

            RequestStatus = entity.RequestStatus,

            CompletionDate = entity.CompletionDate,

            RepairParts = entity.RepairParts,

            MasterId = entity.MasterId,

            ClientId = entity.ClientId,

        });
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] JsonPatchDocument<RequestUpdateDto> patch)
    {
        if (patch is null) return BadRequest("Patch document is required.");

        var entity = await _db.Set<Request>().FirstOrDefaultAsync(x => x.RequestId == id);
        if (entity is null) return NotFound();

        var dto = new RequestUpdateDto
        {




            StartDate = entity.StartDate,



            ClimateTechType = entity.ClimateTechType,



            ClimateTechModel = entity.ClimateTechModel,



            ProblemDescription = entity.ProblemDescription,



            RequestStatus = entity.RequestStatus,



            CompletionDate = entity.CompletionDate,



            RepairParts = entity.RepairParts,



            MasterId = entity.MasterId,



            ClientId = entity.ClientId,


        };

        patch.ApplyTo(dto, ModelState);
        if (!ModelState.IsValid) return ValidationProblem(ModelState);





        entity.StartDate = dto.StartDate;



        entity.ClimateTechType = dto.ClimateTechType;



        entity.ClimateTechModel = dto.ClimateTechModel;



        entity.ProblemDescription = dto.ProblemDescription;



        entity.RequestStatus = dto.RequestStatus;



        entity.CompletionDate = dto.CompletionDate;



        entity.RepairParts = dto.RepairParts;



        entity.MasterId = dto.MasterId;



        entity.ClientId = dto.ClientId;



        await _db.SaveChangesAsync();

        return Ok(new RequestDto
        {

            RequestId = entity.RequestId,

            StartDate = entity.StartDate,

            ClimateTechType = entity.ClimateTechType,

            ClimateTechModel = entity.ClimateTechModel,

            ProblemDescription = entity.ProblemDescription,

            RequestStatus = entity.RequestStatus,

            CompletionDate = entity.CompletionDate,

            RepairParts = entity.RepairParts,

            MasterId = entity.MasterId,

            ClientId = entity.ClientId,

        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Set<Request>().FirstOrDefaultAsync(x => x.RequestId == id);
        if (entity is null) return NotFound();

        _db.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
