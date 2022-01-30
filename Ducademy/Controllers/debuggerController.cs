using Ducademy.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Web;

namespace Ducademy.Controllers
{
    public class debuggerController : Controller
    {
        private readonly ILogger<debuggerController> _logger;

        public debuggerController(ILogger<debuggerController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Codeditor()
        {
            return View("Codeditor");
        }

    }
}