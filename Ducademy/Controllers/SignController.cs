#pragma warning disable CS8600
using Ducademy.Models;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Ducademy.Database;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;

namespace Ducademy.Controllers
{
    public class SignController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public SignController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("/sign")]
        public IActionResult Index()
        {
            return View("Signin");
        }

        [HttpPost]
        [Route("/sign/signin")]
        public IActionResult SigninProc()
        {
            UserQurey db = HttpContext.RequestServices.GetService(typeof(UserQurey)) as UserQurey;
            UserData userdata = new(Request.Form["signin_id"], Request.Form["signin_password"], "null");
            int result = db.Signin(userdata);
            if(result > 0)
            {
                var identity = new ClaimsIdentity(CookieAuthenticationDefaults.AuthenticationScheme,
                    ClaimTypes.Name, ClaimTypes.Role);
                identity.AddClaim(new Claim(ClaimTypes.Name, result.ToString(), "Name"));
                identity.AddClaim(new Claim("LastCheckDateTime", DateTime.UtcNow.ToString("yyyyMMddHHmmss")));
                identity.AddClaim(new Claim("id", result.ToString()));

                Console.WriteLine("Login Sucess " + result);
                var principal = new ClaimsPrincipal(identity);
                HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
                {
                    IsPersistent = false,
                    ExpiresUtc = DateTime.UtcNow.AddHours(4),
                    AllowRefresh = true
                });
                return Redirect("/");
            }
            else
            {
                return Redirect($"/sign/result?msg={HttpUtility.UrlEncode("존재하지 않는 계정입니다")}");
            }
        }

        [HttpPost]
        [Route("/sign/signup")]
        public IActionResult SignupProc()
        {
            if(Request.Form["signup_password"] == Request.Form["signup_passwordcheck"])
            {
                Console.WriteLine(Request.Form["signup_password"]);
                Console.WriteLine(Request.Form["signup_passwordcheck"]);
                UserQurey db = HttpContext.RequestServices.GetService(typeof(UserQurey)) as UserQurey;
                UserData userdata = new(Request.Form["signup_email"], Request.Form["signup_password"], Request.Form["signup_name"]);
                return Redirect(db.Signup(userdata));
            }
            else
            {
                return Redirect($"/sign/result?msg={HttpUtility.UrlEncode("비밀번호가 다릅니다")}");
            }
        }

        public async Task<IActionResult> Signout()
        {
            await HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme);
            return Redirect("/");
        }
        public IActionResult Result(string msg)
        {
            ViewData["result"] = msg;
            return View();
        }
    }
}