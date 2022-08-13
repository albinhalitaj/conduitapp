FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["webapp.API/webapp.API.csproj", "webapp.API/"]
RUN dotnet restore "webapp.API/webapp.API.csproj"
COPY . .
WORKDIR "/src/webapp.API"
RUN dotnet build "webapp.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "webapp.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "webapp.API.dll"]
