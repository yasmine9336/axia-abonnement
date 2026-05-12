using System.ComponentModel.DataAnnotations;

namespace AxiaAbonnement.Models.Validation
{
    public class MinWordCountAttribute : ValidationAttribute
    {
        private readonly int _min;

        public MinWordCountAttribute(int min) { _min = min; }

        protected override ValidationResult? IsValid(object? value, ValidationContext context)
        {
            if (value is string str)
            {
                var count = str.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
                if (count < _min)
                    return new ValidationResult($"Ce champ doit contenir au moins {_min} mots.");
            }
            return ValidationResult.Success;
        }
    }
}