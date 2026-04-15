namespace AxiaAbonnement.Models.Common;

public enum ServiceResultStatus { Ok, NotFound, Forbidden, BadRequest }

public class ServiceResult<T>
{
    public ServiceResultStatus Status { get; init; }
    public T? Data { get; init; }
    public string? ErrorMessage { get; init; }

    public static ServiceResult<T> Ok(T data) =>
        new() { Status = ServiceResultStatus.Ok, Data = data };

    public static ServiceResult<T> NotFound(string msg = "Introuvable.") =>
        new() { Status = ServiceResultStatus.NotFound, ErrorMessage = msg };

    public static ServiceResult<T> Forbidden() =>
        new() { Status = ServiceResultStatus.Forbidden };

    public static ServiceResult<T> BadRequest(string msg) =>
        new() { Status = ServiceResultStatus.BadRequest, ErrorMessage = msg };
}
