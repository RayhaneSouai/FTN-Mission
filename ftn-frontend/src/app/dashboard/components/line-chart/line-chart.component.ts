import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { curveMonotoneX } from 'd3-shape';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { INSCRIPTION_CHART_COLORS, NgxChartSeries } from '../../utils/inscription-activity.builder';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements AfterViewInit, OnDestroy {
  @Input() chartData: NgxChartSeries[] = [];
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLElement>;

  view: [number, number] = [700, 320];
  readonly curve = curveMonotoneX;
  readonly colorScheme: Color = {
    name: 'ftn-inscriptions',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: INSCRIPTION_CHART_COLORS
  };
  readonly legendPosition = LegendPosition.Below;

  legend = true;
  xAxis = true;
  yAxis = true;
  showXAxisLabel = false;
  showYAxisLabel = true;
  yAxisLabel = 'Inscriptions';
  gradient = false;
  autoScale = true;
  timeline = true;
  animations = true;
  roundDomains = true;
  showGridLines = true;

  private resizeObserver?: ResizeObserver;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? 700;
      const chartWidth = Math.max(280, Math.floor(width));
      const chartHeight = Math.max(260, Math.min(380, Math.floor(chartWidth * 0.42)));
      this.view = [chartWidth, chartHeight];
      this.cdr.markForCheck();
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
