import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Channel, type ChannelSummary } from "@/api/models/channel-analysis";
import {
  CompetitorApproval,
  CompetitorRole,
  type Competitor,
  type CompetitorsList,
} from "@/api/models/competitor";
import {
  ProjectPhase,
  ProjectPlatform,
  type Project,
} from "@/api/models/project";
import { API_ROUTES } from "@/api/routes";
import { mockApi, type MockRoutes } from "@/__tests__/utils/mock-api";
import { renderWithProviders } from "@/__tests__/utils/render-with-providers";
import { Sidebar } from "@/layout/components/sidebar/sidebar";

const FIRST_PROJECT_ID = "p1";
const SECOND_PROJECT_ID = "p2";

function buildProject(
  id: string,
  name: string,
  platform: ProjectPlatform,
): Project {
  return {
    id,
    name,
    platform,
    phase: ProjectPhase.NO_CUSTOMERS,
    description: "Descrição",
    createdAt: "2026-03-01T12:00:00.000Z",
    updatedAt: "2026-03-01T12:00:00.000Z",
  };
}

const projects = [
  buildProject(FIRST_PROJECT_ID, "Zeta", ProjectPlatform.WEB),
  buildProject(SECOND_PROJECT_ID, "Alfa", ProjectPlatform.MOBILE),
  buildProject("p3", "Beta", ProjectPlatform.BOTH),
];

const competitor: Competitor = {
  id: "c1",
  name: "Rival",
  role: CompetitorRole.MAIN,
  marketFocus: "Foco",
  services: "Serviços",
  features: "Funcionalidades",
  audience: "Público",
  rationale: "Motivo",
  url: null,
  incorrect: false,
  qualifiedAt: "2026-03-02T12:00:00.000Z",
};

const noList: CompetitorsList = {
  approval: CompetitorApproval.PENDING,
  competitors: [],
};
const pendingList: CompetitorsList = {
  approval: CompetitorApproval.PENDING,
  competitors: [competitor],
};
const approvedList: CompetitorsList = {
  approval: CompetitorApproval.APPROVED,
  competitors: [competitor],
};

function buildChannel(
  channel: Channel,
  overrides: Partial<ChannelSummary> = {},
): ChannelSummary {
  return {
    channel,
    partial: false,
    collected: true,
    score: 5,
    collectedAt: "2026-03-03T12:00:00.000Z",
    ...overrides,
  };
}

const channels: ChannelSummary[] = [
  buildChannel(Channel.LINKEDIN, { score: 8 }),
  buildChannel(Channel.SEO, { score: 6 }),
  buildChannel(Channel.X_NETWORK, { score: 3, partial: true }),
  buildChannel(Channel.TIKTOK, {
    score: null,
    partial: true,
    collected: false,
    collectedAt: null,
  }),
  buildChannel(Channel.YOUTUBE, {
    score: null,
    collected: false,
    collectedAt: null,
  }),
];

const projectsRoute = `GET ${API_ROUTES.projects.list}`;
const competitorsRoute = (projectId: string) =>
  `GET ${API_ROUTES.competitors.list(projectId)}`;
const channelsRoute = (projectId: string) =>
  `GET ${API_ROUTES.channels.list(projectId)}`;

const serverError = {
  status: 500,
  body: { error: { code: "internal", message: "Falhou" } },
};
const neverReplies = () => new Promise<never>(() => undefined);

function buildRoutes(
  projectId: string,
  list: CompetitorsList,
  summaries: ChannelSummary[],
): MockRoutes {
  return {
    [competitorsRoute(projectId)]: { body: list },
    [channelsRoute(projectId)]: { body: { channels: summaries } },
  };
}

const OPEN_PROJECT_ROUTE_PATH = "/projects/:projectId/*";
const NEW_PROJECT_PATH = "/projects/new";

function renderSidebar(
  routes: MockRoutes,
  {
    initialEntry = `/projects/${FIRST_PROJECT_ID}`,
    routePath = OPEN_PROJECT_ROUTE_PATH,
  } = {},
) {
  const api = mockApi({ [projectsRoute]: { body: { projects } }, ...routes });
  const view = renderWithProviders(<Sidebar />, { initialEntry, routePath });
  return { ...view, ...api };
}

async function openMenu(user: ReturnType<typeof renderWithProviders>["user"]) {
  await user.click(
    await screen.findByRole("button", { name: /Trocar de projeto/ }),
  );
  return screen.getByRole("menu", { name: "Trocar de projeto" });
}

describe("Sidebar", () => {
  describe("project select", () => {
    it("shows the closed select with the name and the type of the open project", async () => {
      renderSidebar(buildRoutes(FIRST_PROJECT_ID, noList, channels));

      const trigger = await screen.findByRole("button", {
        name: "Trocar de projeto. Atual: Zeta",
      });

      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(within(trigger).getByText("web")).toBeInTheDocument();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it('opens the menu with the projects in alphabetical order, the open one checked and "Novo projeto" at the end', async () => {
      const { user } = renderSidebar(
        buildRoutes(FIRST_PROJECT_ID, noList, channels),
      );

      const menu = await openMenu(user);

      const options = within(menu).getAllByRole("menuitemradio");
      expect(options.map((option) => option.textContent)).toEqual([
        expect.stringContaining("Alfa"),
        expect.stringContaining("Beta"),
        expect.stringContaining("Zeta"),
      ]);
      expect(
        options.map((option) => option.getAttribute("aria-checked")),
      ).toEqual(["false", "false", "true"]);
      expect(
        within(menu).getByRole("menuitem", { name: "Novo projeto" }),
      ).toHaveAttribute("href", "/projects/new");
      expect(
        screen.getByRole("button", { name: /Trocar de projeto/ }),
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("closes the menu when the user clicks outside of it", async () => {
      const { user } = renderSidebar(
        buildRoutes(FIRST_PROJECT_ID, noList, channels),
      );
      await openMenu(user);

      await user.click(document.body);

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes the menu when the user presses Escape", async () => {
      const { user } = renderSidebar(
        buildRoutes(FIRST_PROJECT_ID, noList, channels),
      );
      await openMenu(user);

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("switches to the chosen project, closes the menu and reads channels and competitors of the new project", async () => {
      const { user, requestsTo } = renderSidebar({
        ...buildRoutes(FIRST_PROJECT_ID, noList, channels),
        ...buildRoutes(SECOND_PROJECT_ID, approvedList, [
          buildChannel(Channel.REDDIT, { score: 9 }),
        ]),
      });
      const menu = await openMenu(user);
      expect(await screen.findByText("LinkedIn")).toBeInTheDocument();
      expect(
        requestsTo("GET", API_ROUTES.channels.list(SECOND_PROJECT_ID)),
      ).toHaveLength(0);

      await user.click(
        within(menu).getByRole("menuitemradio", { name: /Alfa/ }),
      );

      expect(
        await screen.findByRole("button", {
          name: "Trocar de projeto. Atual: Alfa",
        }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(await screen.findByText("Reddit")).toBeInTheDocument();
      expect(screen.queryByText("LinkedIn")).not.toBeInTheDocument();
      expect(
        requestsTo("GET", API_ROUTES.channels.list(SECOND_PROJECT_ID)),
      ).toHaveLength(1);
      expect(
        requestsTo("GET", API_ROUTES.competitors.list(SECOND_PROJECT_ID)),
      ).toHaveLength(1);
      expect(await screen.findByText("aprovada")).toBeInTheDocument();
    });

    it("shows only the logo and the select, without sections, when no project is open", async () => {
      renderSidebar(
        {},
        { initialEntry: NEW_PROJECT_PATH, routePath: NEW_PROJECT_PATH },
      );

      expect(
        await screen.findByRole("button", { name: "Trocar de projeto" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Escolher projeto")).toBeInTheDocument();
      expect(screen.queryByText("Concorrentes")).not.toBeInTheDocument();
      expect(screen.queryByText("Pesquisa inicial")).not.toBeInTheDocument();
    });

    it("shows the loading message and then an error with a retry button that recovers", async () => {
      let attempts = 0;
      const { user } = renderSidebar({
        ...buildRoutes(FIRST_PROJECT_ID, noList, channels),
        [projectsRoute]: () =>
          ++attempts === 1 ? serverError : { body: { projects } },
      });

      expect(screen.getByText("Carregando projetos...")).toBeInTheDocument();
      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Não foi possível carregar os projetos.");

      await user.click(
        within(alert).getByRole("button", { name: "Tentar de novo" }),
      );

      expect(
        await screen.findByRole("button", {
          name: "Trocar de projeto. Atual: Zeta",
        }),
      ).toBeInTheDocument();
    });

    it('shows the empty state with "Novo projeto" when there are no projects', async () => {
      renderSidebar(
        { [projectsRoute]: { body: { projects: [] } } },
        { initialEntry: NEW_PROJECT_PATH, routePath: NEW_PROJECT_PATH },
      );

      expect(
        await screen.findByText("Nenhum projeto ainda."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Novo projeto" }),
      ).toHaveAttribute("href", "/projects/new");
    });
  });

  describe("Concorrentes section", () => {
    it.each([
      ["no list yet", noList, "sem lista"],
      ["a list waiting for approval", pendingList, "aguardando aprovação"],
      ["an approved list", approvedList, "aprovada"],
    ])(
      'shows the "Lista de concorrentes" item with the seal for %s',
      async (_description, list, seal) => {
        renderSidebar(buildRoutes(FIRST_PROJECT_ID, list, channels));

        const item = await screen.findByRole("link", {
          name: /Lista de concorrentes/,
        });

        expect(await within(item).findByText(seal)).toBeInTheDocument();
        expect(item).toHaveAttribute(
          "href",
          `/projects/${FIRST_PROJECT_ID}/competitors`,
        );
      },
    );

    it("shows the item without a seal while the list is loading", () => {
      renderSidebar({
        [competitorsRoute(FIRST_PROJECT_ID)]: neverReplies,
        [channelsRoute(FIRST_PROJECT_ID)]: neverReplies,
      });

      expect(screen.queryByText("sem lista")).not.toBeInTheDocument();
      expect(screen.queryByText("aprovada")).not.toBeInTheDocument();
    });
  });

  describe("Pesquisa inicial section", () => {
    it("dims the section and shows the note while the list is not approved", async () => {
      renderSidebar(buildRoutes(FIRST_PROJECT_ID, pendingList, channels));

      expect(
        await screen.findByText(
          "Libera depois que você aprovar a lista de concorrentes.",
        ),
      ).toBeInTheDocument();
      expect(await screen.findByRole("link", { name: /LinkedIn/ })).toHaveClass(
        "opacity-60",
      );
    });

    it("does not dim the section nor show the note when the list is approved", async () => {
      renderSidebar(buildRoutes(FIRST_PROJECT_ID, approvedList, channels));

      expect(
        await screen.findByRole("link", { name: /LinkedIn/ }),
      ).not.toHaveClass("opacity-60");
      expect(
        screen.queryByText(
          "Libera depois que você aprovar a lista de concorrentes.",
        ),
      ).not.toBeInTheDocument();
    });

    it("lists the channels in the order the server sent, each with its score", async () => {
      renderSidebar(buildRoutes(FIRST_PROJECT_ID, approvedList, channels));

      await screen.findByRole("link", { name: /LinkedIn/ });
      const channelLinks = screen
        .getAllByRole("link")
        .filter((link) =>
          link
            .getAttribute("href")
            ?.startsWith(`/projects/${FIRST_PROJECT_ID}/channels/`),
        );

      expect(channelLinks.map((link) => link.getAttribute("href"))).toEqual([
        `/projects/${FIRST_PROJECT_ID}/channels/linkedin`,
        `/projects/${FIRST_PROJECT_ID}/channels/seo`,
        `/projects/${FIRST_PROJECT_ID}/channels/x`,
        `/projects/${FIRST_PROJECT_ID}/channels/tiktok`,
        `/projects/${FIRST_PROJECT_ID}/channels/youtube`,
      ]);
      expect(within(channelLinks[0]).getByText("8")).toBeInTheDocument();
      expect(within(channelLinks[1]).getByText("6")).toBeInTheDocument();
      expect(within(channelLinks[2]).getByText("3")).toBeInTheDocument();
      expect(
        within(channelLinks[3]).queryByText(/^\d+$/),
      ).not.toBeInTheDocument();
    });

    it('marks "parcial sem login" and "sem coleta", alone or together', async () => {
      renderSidebar(buildRoutes(FIRST_PROJECT_ID, approvedList, channels));

      const partialOnly = await screen.findByRole("link", { name: /^3\s*X/ });
      const both = screen.getByRole("link", { name: /TikTok/ });
      const notCollectedOnly = screen.getByRole("link", { name: /YouTube/ });
      const collected = screen.getByRole("link", { name: /LinkedIn/ });

      expect(
        within(partialOnly).getByText("parcial sem login"),
      ).toBeInTheDocument();
      expect(
        within(partialOnly).queryByText("sem coleta"),
      ).not.toBeInTheDocument();
      expect(within(both).getByText("parcial sem login")).toBeInTheDocument();
      expect(within(both).getByText("sem coleta")).toBeInTheDocument();
      expect(
        within(notCollectedOnly).getByText("sem coleta"),
      ).toBeInTheDocument();
      expect(
        within(notCollectedOnly).queryByText("parcial sem login"),
      ).not.toBeInTheDocument();
      expect(
        within(collected).queryByText("sem coleta"),
      ).not.toBeInTheDocument();
      expect(
        within(collected).queryByText("parcial sem login"),
      ).not.toBeInTheDocument();
    });

    it("shows the loading message while the channels are on their way", () => {
      renderSidebar({
        [competitorsRoute(FIRST_PROJECT_ID)]: neverReplies,
        [channelsRoute(FIRST_PROJECT_ID)]: neverReplies,
      });

      expect(screen.getByText("Carregando canais...")).toBeInTheDocument();
    });

    it("shows an error with a retry button when the channels fail, and recovers on retry", async () => {
      let attempts = 0;
      const { user } = renderSidebar({
        [competitorsRoute(FIRST_PROJECT_ID)]: { body: approvedList },
        [channelsRoute(FIRST_PROJECT_ID)]: () =>
          ++attempts === 1 ? serverError : { body: { channels } },
      });

      const alert = await screen.findByText(
        "Não foi possível carregar os canais.",
      );
      await user.click(
        within(alert.parentElement as HTMLElement).getByRole("button", {
          name: "Tentar de novo",
        }),
      );

      expect(
        await screen.findByRole("link", { name: /LinkedIn/ }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Não foi possível carregar os canais."),
      ).not.toBeInTheDocument();
    });
  });
});
