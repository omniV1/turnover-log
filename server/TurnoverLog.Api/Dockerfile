FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY nuget.config ./
COPY server/TurnoverLog.Api/TurnoverLog.Api.csproj server/TurnoverLog.Api/
RUN dotnet restore server/TurnoverLog.Api/TurnoverLog.Api.csproj

COPY server/TurnoverLog.Api/ server/TurnoverLog.Api/
WORKDIR /src/server/TurnoverLog.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TurnoverLog.Api.dll"]
