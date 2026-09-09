import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';

@Controller('api/v1/organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }
    @Post()
    create(@Body() dto: CreateOrganizationDto) {
        return this.organizationsService.create(dto);
    }

    @Get()
    findAll() {
        return this.organizationsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.organizationsService.findById(id);
    }
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateOrganizationDto,
    ) {
        return this.organizationsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.organizationsService.delete(id);
    }


}
